import bcrypt from 'bcrypt';
import { pool } from '../../config/db.js'; // Using pool from db.js
import { createProfile } from './UserProfile_model.js';

// Create a new user (Sign Up)
const createUser = async (name, email, password) => {
    try {
        // Check if email already exists
        const existingEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingEmail.rows.length > 0) {
            return { success: false, message: 'Email already exists' };
        }

        // Check if name already exists
        const existingName = await pool.query('SELECT * FROM users WHERE name = $1', [name]);
        if (existingName.rows.length > 0) {
            return { success: false, message: 'Name already exists' };
        }

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user with hashed password
        const userResult = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]
        );

        const userId = userResult.rows[0].id; // Get the created user's ID

        const profileResult = await createProfile(userId);
        if (!profileResult.success) {
          return { success: false, message: 'User created, but profile creation failed' };
        }
        
        // Omit the password from the response
        const { password: omittedPassword, ...userWithoutPassword } = userResult.rows[0];

        return { success: true, message: 'User created successfully', user: userWithoutPassword };
    } catch (error) {
        console.error('Error creating user:', error);  // Log the full error
        return { success: false, message: 'Error creating user' };
    }
};

// Sign in a user (Authentication) with transaction handling
const LoginUser = async (email, password) => {
    const client = await pool.connect(); // Get a new client for the transaction
    try {
        // Start the transaction
        await client.query('BEGIN');
        
        // Find the user by email
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return { success: false, message: 'User not found' };
        }

        const user = result.rows[0];

        if (user.activity == true){
            return { success: false, message: 'user already login' };
        };

        // Compare the password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return { success: false, message: 'Invalid credentials' };
        }

        // Update the activity field to true
        const updateActivityResult = await client.query(
            'UPDATE users SET activity = $1 WHERE email = $2 RETURNING *',
            [true, email]
        );
        
        if (updateActivityResult.rows.length === 0) {
            // If update fails, rollback the transaction
            await client.query('ROLLBACK');
            return { success: false, message: 'Failed to update activity' };
        }

        // Commit the transaction if all queries succeed
        await client.query('COMMIT');

        // Omit the password from the response
        const { password: omittedPassword, ...userWithoutPassword } = user;

        // Return the user data with updated activity status
        return {
            success: true,
            message: 'Sign-in successful',
            user: {
                ...userWithoutPassword,
                activity: updateActivityResult.rows[0].activity
            }
        };

    } catch (error) {
        // In case of any error, rollback the transaction
        await client.query('ROLLBACK');
        console.error('Error during sign-in:', error);
        return { success: false, message: 'Database error' };
    } finally {
        // Release the client back to the pool
        client.release();
    }
};

const SignOut = async (id) => {
    try {
        console.log("signout id is: ", id)
        const result = await pool.query(
            'UPDATE users SET activity = $1 WHERE id = $2 RETURNING *',
            [false, id]
        );

        if (result.rows.length === 0) {
            console.log('Failed to sign out user')
            return { success: false, message: 'Failed to sign out user' };
        }

        return { success: true, message: 'Sign-out successful' };
        
    } catch (error) {
        console.error('Error signing out user:', error);
        return { success: false, message: 'Error signing out user' };
    }
};

export { LoginUser, createUser, SignOut };
