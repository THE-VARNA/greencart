import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe"
import User from "../models/User.js"

// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res)=>{
    try {
        const { userId, items, address } = req.body;
        if(!address || items.length === 0){
            return res.json({success: false, message: "Invalid data"})
        }
        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item)=>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
        });

        return res.json({success: true, message: "Order Placed Successfully" })
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res)=>{
    try {
        const { userId, items, address } = req.body;
        const {origin} = req.headers;

        if(!address || items.length === 0){
            return res.json({success: false, message: "Invalid data"})
        }

        let productData = [];

        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item)=>{
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            });
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

       const order =  await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
        });

    // Stripe Gateway Initialize    
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // create line items for stripe

     const line_items = productData.map((item)=>{
        return {
            price_data: {
                currency: "usd",
                product_data:{
                    name: item.name,
                },
                unit_amount: Math.floor(item.price + item.price * 0.02)  * 100
            },
            quantity: item.quantity,
        }
     })

     // create session
     const session = await stripeInstance.checkout.sessions.create({
        line_items,
        mode: "payment",
        success_url: `${origin}/loader?next=my-orders`,
        cancel_url: `${origin}/cart`,
        metadata: {
            orderId: order._id.toString(),
            userId,
        }
     })

        return res.json({success: true, url: session.url });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
// Stripe Webhooks to Verify Payments Action : /stripe
export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];
    let event;

    console.log("[STRIPE WEBHOOK] Received request headers:", request.headers);
    console.log(`[STRIPE WEBHOOK] Body Type: ${typeof request.body}, Length: ${request.body?.length}`);

    try {
        const secret = process.env.STRIPE_WEBHOOK_SECRET.trim();
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            secret
        );
    } catch (error) {
        console.error(`[STRIPE WEBHOOK] Signature Verification Failed: ${error.message}`);
        
        // Diagnostic check: Stripe signatures require the RAW body. 
        // If it's an object, some middleware is pre-parsing it.
        if (typeof request.body !== 'string' && !Buffer.isBuffer(request.body)) {
            console.error("[STRIPE WEBHOOK] ERROR: Request body is NOT raw (it's likely an object). This will ALWAYS fail signature verification.");
        }
        
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    console.log(`[STRIPE WEBHOOK] Verified Event Type: ${event.type}`);

    // Handle the event
    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                const { orderId, userId } = session.metadata;

                if (!orderId || !userId) {
                    console.error("[STRIPE WEBHOOK] Missing metadata in session:", session.metadata);
                    return response.status(400).send("Missing metadata");
                }

                console.log(`[STRIPE WEBHOOK] Fulfillment Started - Order: ${orderId}, User: ${userId}`);

                // Mark Payment as Paid
                const updatedOrder = await Order.findByIdAndUpdate(orderId, { isPaid: true }, { new: true });
                if (!updatedOrder) {
                    console.error(`[STRIPE WEBHOOK] Order ${orderId} not found in database!`);
                }

                // Clear user cart
                await User.findByIdAndUpdate(userId, { cartItems: {} });
                
                console.log(`[STRIPE WEBHOOK] Fulfillment Success - Order ${orderId} is now paid.`);
                break;
            }

            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object;
                console.log(`[STRIPE WEBHOOK] Payment failed for intent: ${paymentIntent.id}`);
                break;
            }

            default:
                console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
                break;
        }
    } catch (dbError) {
        console.error(`[STRIPE WEBHOOK] Database Update failed: ${dbError.message}`);
        return response.status(500).send("Internal Server Error during fulfillment");
    }

    response.json({ received: true });
}


// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res)=>{
    try {
        const { userId } = req.body;
        const orders = await Order.find({
            userId,
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


// Get All Orders ( for seller / admin) : /api/order/seller
export const getAllOrders = async (req, res)=>{
    try {
        const orders = await Order.find({
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}