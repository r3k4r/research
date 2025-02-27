import { PrismaAdapter } from "@next-auth/prisma-adapter";

// This custom adapter extends the PrismaAdapter but modifies the createUser function
export function CustomPrismaAdapter(prisma) {
  const defaultAdapter = PrismaAdapter(prisma);
  
  return {
    ...defaultAdapter,
    createUser: async (data) => {
      // Extract profile data that should go to the UserProfile
      const { name, image, ...userData } = data;
      
      // Create user without name and image (which are now in UserProfile)
      const user = await prisma.user.create({
        data: {
          ...userData,
          role: "USER",
          // Create the UserProfile at the same time using nested writes
          profile: {
            create: {
              name: name || userData.email.split('@')[0], // Fallback to email prefix
              image: image
            }
          }
        },
        include: {
          profile: true
        }
      });
      
      // Return the user with synthetic name/image properties to satisfy NextAuth
      return {
        ...user,
        name: user.profile?.name, // Add name from profile for NextAuth
        image: user.profile?.image // Add image from profile for NextAuth
      };
    },
    
    // Make sure we include profiles when getting users
    getUser: async (id) => {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { profile: true, providerProfile: true }
      });
      
      if (!user) return null;
      
      // Attach profile data to user object
      const profile = user.profile || user.providerProfile;
      return {
        ...user,
        name: profile?.name || profile?.businessName,
        image: profile?.image || profile?.logo
      };
    },
    
    getUserByEmail: async (email) => {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true, providerProfile: true }
      });
      
      if (!user) return null;
      
      // Attach profile data to user object
      const profile = user.profile || user.providerProfile;
      return {
        ...user,
        name: profile?.name || profile?.businessName,
        image: profile?.image || profile?.logo
      };
    }
  };
}
