import { axiosInstance } from "./ApiHandler";
import { toast } from "sonner";

export const downloadContingencyDoc = async (row) => {
  try {
    const response = await axiosInstance.get(
      `/api/project/contingency-doc/?contignecy_no=${row.id}`,
      { responseType: "blob" }
    );

    if (response.status === 200) {
      // Create URL for blob object
      const url = URL.createObjectURL(response.data);

      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = url;
      link.download = `${row.contingency_no}_contingency.pdf`; // Specify the document name

      // Trigger the download by programmatically clicking the anchor element
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Release memory
    } else {
      toast.error("Something went wrong");
    }
  } catch (error) {
    toast.error("Something went wrong");
  }
};
