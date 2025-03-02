import { PrismaAdapter } from "@next-auth/prisma-adapter";

// ===============================================
// CUSTOM PRISMA ADAPTER EXPLANATION
// ===============================================
// This file creates a customized version of the NextAuth PrismaAdapter.
// The standard adapter doesn't work well with our normalized database 
// where user info is split between User and UserProfile tables.
// This custom adapter helps bridge that gap.

export function CustomPrismaAdapter(prisma) {
  // Start with the default adapter that handles most NextAuth operations
  const defaultAdapter = PrismaAdapter(prisma);
  
  // Return a new object that includes all the default adapter functions
  // but overrides some specific functions to work with our schema
  return {
    // Keep all the default adapter functions
    ...defaultAdapter,

    // ===============================================
    // OVERRIDE: USER CREATION
    // ===============================================
    // This overrides how users are created when they sign up or use OAuth
    createUser: async (data) => {
      // Extract name and image which belong in UserProfile, not User table
      const { name, image, ...userData } = data;
      
      // Create both a User record AND a UserProfile in one database operation
      // This is called a "nested write" in Prisma
      const user = await prisma.user.create({
        data: {
          ...userData,  // Email and other core fields
          role: "USER", // Default role for new users
          
          // Create the UserProfile at the same time
          profile: {
            create: {
              // Use provided name or fallback to email username part
              name: name || userData.email.split('@')[0],
              image: image // Profile picture (often from OAuth)
            }
          }
        },
        // Make sure to include the profile data in the response
        include: {
          profile: true
        }
      });
      
      // NextAuth expects user objects to have name/image directly
      // So we add these "virtual" properties from the profile
      return {
        ...user,
        name: user.profile?.name,    // Add name from profile 
        image: user.profile?.image   // Add image from profile
      };
    },
    
    // ===============================================
    // OVERRIDE: GET USER BY ID
    // ===============================================
    // When NextAuth needs to get a user by their ID
    getUser: async (id) => {
      // Get user AND their profile data in one query
      const user = await prisma.user.findUnique({
        where: { id },
        include: { profile: true, providerProfile: true }
      });
      
      if (!user) return null;
      
      // Figure out which profile to use (regular user or provider)
      const profile = user.profile || user.providerProfile;
      
      // Return user with virtual name/image properties
      return {
        ...user,
        name: profile?.name || profile?.businessName,
        image: profile?.image || profile?.logo
      };
    },
    
    // ===============================================
    // OVERRIDE: GET USER BY EMAIL
    // ===============================================
    // When NextAuth needs to find a user by email (like during login)
    getUserByEmail: async (email) => {
      // Similar to getUser but searches by email
      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true, providerProfile: true }
      });
      
      if (!user) return null;
      
      // Same logic to add virtual properties
      const profile = user.profile || user.providerProfile;
      return {
        ...user,
        name: profile?.name || profile?.businessName,
        image: profile?.image || profile?.logo
      };
    }
  };
}

// ===============================================
// SUMMARY
// ===============================================
// This adapter solves several problems:
// 1. It puts name/image in the correct UserProfile table
// 2. It makes NextAuth work correctly with our normalized schema
// 3. It handles both types of users (regular and provider)
// 4. It creates consistent user objects with virtual properties
