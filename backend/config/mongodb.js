import mongoose from "mongoose";

const connectDB = async () => {

    try{
        await
        mongoose.connect(process.env.MONGODB_URI,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log("MongoDB Connected Successfuly");
    } catch (err){
        console.error("MOngoDB Connection is Failed", err.message);
        process.exit(1);
    }

    
};

export default connectDB