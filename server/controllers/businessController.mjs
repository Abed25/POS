// controllers/businessController.mjs
import {
  getBusinessById,
  updateBusinessName,
  getAllBusinesses,
} from "../models/businessModel.mjs";

// --- TENANT (ADMIN) FUNCTIONS ---

// /**
//  * @desc Get details of the currently logged-in user's business (tenant).
//  * @access Tenant (Admin/User)
//  */
export const getMyBusinessDetails = async (req, res) => {
  try {
    // Security: Fetches the ID directly from the authenticated token
    const business_id = req.user.business_id;

    const business = await getBusinessById(business_id);

    if (!business) {
      return res
        .status(404)
        .json({ message: "Tenant business record not found" });
    }

    res.json(business);
  } catch (error) {
    res.status(500).json({ message: "Error fetching business details" });
  }
};

// /**
//  * @desc Update the name of the user's business.
//  * @access Tenant Admin
//  */
export const updateMyBusiness = async (req, res) => {
  try {
    // Security: Fetches the ID directly from the authenticated token
    const business_id = req.user.business_id;
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "New name is required for update." });
    }

    await updateBusinessName(business_id, name);

    res.json({ message: "Business name updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating business details" });
  }
};

// --- SUPERADMIN (PLATFORM_ADMIN) FUNCTIONS ---

// /**
//  * @desc Get details of a specific business by ID.
//  * @access Superadmin (platform_admin)
//  */
export const getBusinessDetailsById = async (req, res) => {
  try {
    const business_id = parseInt(req.params.id);

    if (isNaN(business_id)) {
      return res.status(400).json({ message: "Invalid business ID format." });
    }

    const business = await getBusinessById(business_id);

    if (!business) {
      return res
        .status(404)
        .json({ message: `Business with ID ${business_id} not found.` });
    }

    res.json(business);
  } catch (error) {
    res.status(500).json({ message: "Error fetching business details by ID" });
  }
};

// /**
//  * @desc List all businesses/tenants on the entire platform.
//  * @access Superadmin (platform_admin)
//  */
export const listAllBusinesses = async (req, res) => {
  try {
    const businesses = await getAllBusinesses();
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: "Error listing all businesses/tenants" });
  }
};
