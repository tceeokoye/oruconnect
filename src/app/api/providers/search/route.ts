import { type NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import User from "@/models/user";
import { withRole } from "@/lib/auth-middleware";
import Business from "@/models/business";

// GET: Search for providers
async function searchProvidersHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const location = searchParams.get("location") || "";
    const subcategory = searchParams.get("subcategory") || "";

    await connectToDB();

    // Determine matching business owner IDs if category, subcategory, or location is provided
    let matchingBusinessOwnerIds: any[] | null = null;
    
    if (category || subcategory || location) {
      const businessFilter: any = {};
      if (category) businessFilter.categoryId = { $regex: category, $options: "i" };
      if (subcategory) businessFilter.subcategoryId = { $regex: subcategory, $options: "i" };
      if (location) {
        businessFilter.$or = [
          { state: { $regex: location, $options: "i" } },
          { city: { $regex: location, $options: "i" } },
        ];
      }

      const matchingBusinesses = await Business.find(businessFilter).select("owner.id").lean();
      matchingBusinessOwnerIds = matchingBusinesses.map(b => b.owner?.id).filter(id => id);
    }

    // Base query: Must be a provider and approved
    const filter: any = { role: "provider", isApproved: true };

    if (matchingBusinessOwnerIds !== null) {
      filter._id = { $in: matchingBusinessOwnerIds };
    }

    // Text search query across name or bio
    if (query) {
      const regexMatch = { $regex: query, $options: "i" };
      filter.$or = [
        { firstName: regexMatch },
        { lastName: regexMatch },
        { bio: regexMatch },
      ];
    }

    // Fallback: If no business ID matched but location passed, maybe check the User's bio
    if (location && matchingBusinessOwnerIds === null) {
       filter.bio = { $regex: location, $options: "i" };
    }

    const providers = await User.find(filter)
      .select("firstName lastName profilePhoto bio rating ratingCount completedJobs businessId")
      .limit(20)
      .lean();

    return NextResponse.json({ success: true, data: providers }, { status: 200 });
  } catch (error) {
    console.error("Search providers error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export const GET = (req: NextRequest) => withRole(req, searchProvidersHandler, ["client"]);
