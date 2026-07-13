package com.zsecurity.demo.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.zsecurity.demo.entity.UserDTO;
import com.zsecurity.demo.entity.Users;
import com.zsecurity.demo.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class ImageServices {

    @Autowired
    UserRepo repo;

    private static final Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
            "cloud_name", "dmk12g32o",
            "api_key", "293846376963547",
            "api_secret", "G_3eXYqX9Sedf_n24HtAy8jDktY",
            "secure", true
    ));


    public String getImageUrl(MultipartFile file,String email) throws IOException {
        Map responseMap = cloudinary.uploader().upload(file.getBytes(),ObjectUtils.emptyMap());
        Users user = repo.findByEmail(email).orElse(null);
                user.setImageLink(responseMap.get("secure_url").toString());
                repo.save(user);
        return responseMap.get("secure_url").toString();

    }


    public String changeImg(MultipartFile file, String name) throws IOException {
        Map responseMap = cloudinary.uploader().upload(file.getBytes(),ObjectUtils.emptyMap());
        Users users = repo.findByEmail(name).orElse(null);
        users.setImageLink(responseMap.get("secure_url").toString());
        repo.save(users);
        return responseMap.get("secure_url").toString();
    }

    public void removeImage(String name) {
        Users users = repo.findByEmail(name).orElse(null);
        assert users != null;
        users.setImageLink(null);
        repo.save(users);
    }

    public String uploadVideo(MultipartFile videoFile) throws IOException {
        Map responseMap = cloudinary.uploader().upload(videoFile.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "video",  // 👈 important for .webm
                        "folder", "interview_videos/" // optional folder name in Cloudinary
                ));
        return responseMap.get("secure_url").toString();
    }

}
