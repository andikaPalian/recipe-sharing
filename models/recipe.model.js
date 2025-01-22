import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
    title: { 
        type: String,
        required: true 
    },
    description: {
        type: String, 
        required: true 
    },
    ingredients: {
        type: [String], 
        required: true 
    },
    steps: { 
        type: [String], 
        required: true
    },
    prepTime: { 
        type: Number 
    },
    cookTime: { 
        type: Number 
    },
    servings: { 
        type: Number 
    },
    category: { 
        type: String 
    },
    image: { 
        type: String 
    },
    tags: { 
        type: [String] 
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Chef", 
        required: true 
    },
    isPublic: { 
        type: Boolean, 
        default: true 
    },
    likes: { 
        type: Number, 
        default: 0 
    },
    comments: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Chef" },
        comment: { 
            type: String 
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        },
    }],
    cloudinary_id: {
        type: String,
        default: "",
    }
}, {
    timestamps: true,
});

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;