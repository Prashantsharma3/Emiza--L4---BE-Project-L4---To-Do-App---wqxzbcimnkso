const Users = require("../models/user.js");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const saltRounds = 10;
const JWT_SECRET = "newtonSchool";

const loginUser = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await Users.findOne({ 'email': email });

    if (user) {
        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign(
                { userId: user._id },
                JWT_SECRET,
                {
                    expiresIn: "1h",
                }
            );

            res.status(200).json({
                status: 'success',
                token
            });
        } else {
            res.status(403).json({
                message: 'Invalid Password, try again !!',
                status: 'fail'
            });
        }
    } else {
        res.status(404).json({
            message: 'User with this E-mail does not exist !!',
            status: 'fail'
        });
    }
}

const signupUser = async (req, res) => {
    const { email, password, name, role } = req.body;

    const user = await Users.findOne({ email });
    if (user) {
        res.status(409).json({
            message: 'User with given Email already registered',
            status: 'fail'
        });
    }

    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = {
        name,
        email,
        password: hashedPassword,
        role
    };

    try {
        await Users.create(newUser);
        res.status(200).json({
            message: 'User SignedUp successfully',
            status: 'success'
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'Something went wrong'
        });
    }
}

const logout = (req, res) => {
    const token = req.body.token;

    if (!token) {
        return res.status(401).json({
            message: 'Authentication failed: Missing token.',
            status: 'fail'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({
                message: 'Something went wrong',
                status: 'fail',
                error: err
            });
        }

        res.clearCookie('token');
        res.status(200).json({
            message: 'Logged out successfully.',
            status: 'success'
        });
    });
};

module.exports = { loginUser, signupUser, logout };
