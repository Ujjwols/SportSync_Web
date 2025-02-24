import axios from "axios";
import fs from "fs";
import path from "path";

// Function to download and save the image locally
export const saveCloudinaryImage = async (imageUrl, fileName) => {
  try {
    // Use process.cwd() and then "downloads" directly
    const downloadsFolder = path.join(process.cwd(), "downloads");
    // Create the downloads folder if it doesn't exist
    if (!fs.existsSync(downloadsFolder)) {
      fs.mkdirSync(downloadsFolder, { recursive: true });
    }

    const filePath = path.join(downloadsFolder, fileName);

    const response = await axios({
      url: imageUrl,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log(`✅ Image saved locally at ${filePath}`);
        resolve(filePath);
      });
      writer.on("error", (err) => {
        console.error("❌ Error saving image locally:", err);
        reject(err);
      });
    });
  } catch (error) {
    console.error("❌ Error in saveCloudinaryImage:", error);
    throw error;
  }
};
