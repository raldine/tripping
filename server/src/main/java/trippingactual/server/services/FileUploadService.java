package trippingactual.server.services;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.PutObjectResult;

import trippingactual.server.models.FileObject;


@Service
public class FileUploadService {
     @Autowired
    private AmazonS3 S3Client;

    @Value("${do.storage.bucket}")
    private String bucketName;

    @Value("${do.storage.endpoint}")
    private String endPoint;

    // Allowed content types
    private static final String[] ALLOWED_TYPES = {
            "image/png", "image/jpeg", "image/jpg", "image/gif",
            "text/plain", "text/csv",
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    };

    public FileObject uploadFile(MultipartFile file, String comments, String resourceId, FileObject wTiedComponents) {

        String contentType = file.getContentType();
        System.out.println("The content type of this uploaded file is: " + contentType);

        // Validate file type
        if (!isValidFileType(contentType)) {
            System.out.println("Invalid file type uploaded!");
            return null;
        }
        wTiedComponents.setMedia_type(contentType);

        String fileExtension = getFileExtension(contentType);
        String folderName = "userresources/"; 
        String finalFileName = folderName + resourceId + "." + fileExtension;
        System.out.println("current resourceId: " + resourceId);

        System.out.println("Final file name: " + finalFileName);

        // Metadata for S3
        Map<String, String> userData = new HashMap<>();
        userData.put("comments", comments);
        userData.put("resource_id", resourceId);
        userData.put("fileName", wTiedComponents.getOriginal_file_name());
        userData.put("fileSize", String.valueOf(file.getSize()));
        userData.put("uploadDateTime", LocalDateTime.now().toString());

        ObjectMetadata metaData = new ObjectMetadata();
        metaData.setContentLength(file.getSize());
        metaData.setContentType(contentType);
        metaData.setUserMetadata(userData);

        try {
            PutObjectRequest req = new PutObjectRequest(
                    bucketName,
                    finalFileName,
                    file.getInputStream(),
                    metaData);
            req.withCannedAcl(CannedAccessControlList.PublicRead); // Make the file public

            // Upload file
            PutObjectResult resultOfUpload = S3Client.putObject(req);

            // Generate the file URL
            String fileUrl = "https://%s.%s/%s".formatted(bucketName, endPoint, finalFileName);
            System.out.println("File uploaded to: " + fileUrl);

            wTiedComponents.setDo_src_link(fileUrl);

            return wTiedComponents;

        } catch (IOException | SdkClientException e) {
            e.printStackTrace();
            System.out.println("Error during file upload: " + e.getMessage());
            return null;
        }
    }

    // Helper method to validate file type
    private boolean isValidFileType(String contentType) {
        for (String allowedType : ALLOWED_TYPES) {
            if (allowedType.equalsIgnoreCase(contentType)) {
                return true;
            }
        }
        return false;
    }

    // Helper method to extract file extension
    private String extractFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "unknown";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    private String getFileExtension(String contentType) {
        switch (contentType) {
            case "image/png":
                return "png";
            case "image/jpeg":
                return "jpeg";
            case "image/jpg":
                return "jpg";
            case "image/gif":
                return "gif";
            case "text/plain":
                return "txt";
            case "text/csv":
                return "csv";
            case "application/pdf":
                return "pdf";
            case "application/msword":
                return "doc"; // Word (.doc)
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return "docx"; // Word (.docx)
            case "application/vnd.ms-excel":
                return "xls"; // Excel (.xls)
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                return "xlsx"; // Excel (.xlsx)
            default:
                return "bin"; // Default for unknown types
        }
    }

    public String resourceIdGenerator(String comments) {

        String randomUUIDLength24 = UUID.randomUUID().toString().replace("-", "").substring(0, 24);

        switch (comments) {
            case "cimage":
                return "cimage" + randomUUIDLength24;
            case "image":
                return "image" + randomUUIDLength24;
            case "doc":
                return "doc" + randomUUIDLength24;
            case "pdf":
                return "pdf" + randomUUIDLength24;
            default:
                return "bin" + randomUUIDLength24; // Default for unknown types
        }

    }

    public String resourceType(String resourceId) {

        switch (resourceId) {
            case String s when s.startsWith("cimage"):
                return "image";
            case String s when s.startsWith("image"):
                return "image";
            case String s when s.startsWith("doc"):
                return "doc";
            case String s when s.startsWith("pdf"):
                return "pdf";
            default:
                return "bin";
        }

    }

}
