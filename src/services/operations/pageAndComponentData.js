import toast from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { catalogData } from "../apis";


async function getCategoryPageData(categoryId) {
    const toastId = toast.loading("Loading...");
    let result = [];
    try {

        const response = await apiConnector("POST", catalogData.CATALOGPAGEDATA_API, { categoryId: categoryId });

        if (!response?.data?.success) {
            throw new Error("Could not Fetch Category page data")
        }

        result = response?.data;



    } catch (error) {
        console.log(" CATALOG_PAGE DATA API ERROR.....", error,);
        toast.error(error.message);
        result = error.response?.data

    }

    toast.dismiss(toastId)
    return result

}

export default getCategoryPageData