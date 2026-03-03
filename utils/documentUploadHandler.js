import { axiosInstance } from "@/services/ApiHandler";
import { toast } from "sonner";

const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const { data } = await axiosInstance.post(
      "/api/document-upload/",
      formData
    );
    if (data.status.code == 200) {
      toast.success("File Uploaded Successfully!");
      return { type: "success", data: data.path, view: data.document };
      // return { type: "success", data: data.document };
    }
  } catch (error) {
    return { type: "error", error: error };
  }
};

export { handleFileUpload };
