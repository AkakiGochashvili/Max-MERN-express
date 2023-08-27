const { genSalt, hash, compare } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		default: 'https://res.cloudinary.com/a-g/image/upload/v1675187447/User-default.png'
	},
	places: {
		type: [{ type: Schema.Types.ObjectId, required: true, ref: 'Place' }],
		default: [],
	},
});

UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	const generated_salt = await genSalt(10);

	this.password = await hash(this.password, generated_salt);
});

UserSchema.methods.matchPassword = async function (entered_password) {
	return await compare(entered_password, this.password);
};

UserSchema.methods.getJwt = function () {
	return sign({ _id: this._id }, process.env.JWT_SECRET_KEY, {
		expiresIn: 900000,
	});
};

module.exports = model("User", UserSchema);
