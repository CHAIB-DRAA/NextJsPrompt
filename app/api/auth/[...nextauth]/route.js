import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import User from '@models/user';
import { connectToDB } from '@utils/database';

const handler = NextAuth({
    providers: [
        GoogleProvider({
          clientId: process.env.GOOGLE_ID,
          clientSecret: process.env.GOOGLE_SECRET,
        })
      ],
      callbacks: {async session({ session }) {
        try {
          const sessionUser = await User.findOne({
            email: session.user.email
          });
          session.user.id = sessionUser._id.toString();
          return session;
        } catch (error) {
          console.log(error);
        }
      },
        async signIn({ user, account, profile, email, credentials }) {
          if(account.provider === 'google') {
              
            //check the user on your database and return true if is allowed to signIn
            const isAllowedToSignIn = true
              
            if (isAllowedToSignIn) {
                try {
                    await connectToDB();
                    // Check if user already exists
                    const userExists = await User.findOne({ email: profile.email });
            
                    // If not already existing, create a new user
                    if (!userExists) {
                      await User.create({
                        email: profile.email,
                        username: profile.name.replace(" ", "").toLowerCase(),
                        image: profile.picture
                      });
                    }
                  } catch (error) {
                    console.log(error);
                  }
              return true
            } else {
              // Return false to display a default error message
              return false
              // Or you can return a URL to redirect to:
              // return '/unauthorized'
            }
          }
        }
      }
});
export  { handler as GET, handler as POST};