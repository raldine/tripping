package trippingactual.server.services;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import trippingactual.server.models.FileObject;
import trippingactual.server.repositories.UserFilesRepo;

@Service
public class FileManagingServiceSql {

    @Autowired
    private UserFilesRepo userFilesRepo;

    public FileObject upload(FileObject finalObjectBeforeSql) throws IOException, SQLException {

        FileObject reply = userFilesRepo.upload(finalObjectBeforeSql);

        return reply;
    }

    public Optional<FileObject> getFileById(String postId) {

        Optional<FileObject> returnedObj = userFilesRepo.getFilebyID(postId);

        return returnedObj; // Returns the Posts object or Optional.empty() if not found

    }

    public List<FileObject> getFilesByTripId(String tripId) {
        
    List<FileObject> returnedObjects = userFilesRepo.getFilesByTripId(tripId);
    return returnedObjects; // Returns the list of FileObject or an empty list if not found
}


}
