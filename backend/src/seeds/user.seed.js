import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";

config();

const seedUsers = [
    // Kadın Kullanıcılar
    {
      email: "merve.calik@example.com",
      fullName: "Merve Çalık",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
      email: "elif.seven@example.com",
      fullName: "Elif Seven",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      email: "ayse.yilmaz@example.com",
      fullName: "Ayşe Yılmaz",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/3.jpg",
    },
    {
      email: "zeynep.kaya@example.com",
      fullName: "Zeynep Kaya",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
    },
    {
      email: "esra.aydin@example.com",
      fullName: "Esra Aydın",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/5.jpg",
    },
    {
      email: "selin.ozdemir@example.com",
      fullName: "Selin Özdemir",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/6.jpg",
    },
    {
      email: "deniz.karakaya@example.com",
      fullName: "Deniz Karakaya",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/7.jpg",
    },
    {
      email: "ece.aksoy@example.com",
      fullName: "Ece Aksoy",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/women/8.jpg",
    },
  
    // Erkek Kullanıcılar
    {
      email: "mehdi.tuncer@example.com",
      fullName: "Mehdi Tuncer",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      email: "gokhan.ada@example.com",
      fullName: "Gökhan Karaca",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
      email: "ramil.shkuov@example.com",
      fullName: "Ramil Shkuov",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
      email: "ali.erdem@example.com",
      fullName: "Ali Erdem",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
    },
    {
      email: "emre.kilic@example.com",
      fullName: "Emre Kılıç",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
    },
    {
      email: "mert.demir@example.com",
      fullName: "Mert Demir",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/6.jpg",
    },
    {
      email: "furkan.tasci@example.com",
      fullName: "Furkan Taşcı",
      password: "123456",
      profilePic: "https://randomuser.me/api/portraits/men/7.jpg",
    },
  ];
  

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.insertMany(seedUsers);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();