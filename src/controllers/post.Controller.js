const prisma = require("../configs/databaseConfig");
const jwt = require("jsonwebtoken");
const { postScheema, postUpdate, postRadius } = require("../validations/post");

const express = require("express");
const app = express();

require("dotenv").config();

exports.addPost = async (req, res) => {
  try {
    const { error, value } = postScheema(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }
    const { title, body, address, longitude, latitude, categoryId } = value;
    const userId = req.user.id;
    const isUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    
    const isCategory = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });
    if (!isCategory) {
      return res.status(404).json({ message: "message Category not found" });
    }
    const categoryName = isCategory.name;
    if (!isUser) {
      return res.status(404).json({ message: "message User not found" });
    }

    const postUserName = isUser.firstName + " "+ isUser.lastName
    const postUserProfileImage = isUser.profile_image
     
    const poste = await prisma.post.create({
      data: {
        title,
        body,
        address,
        longitude,
        latitude,
        userId,
        postUserName,
        postUserProfileImage,
        categoryId,
        categoryName,
      },
    });
    return res.status(201).json({
      message: "Post created successfully",
      data: poste,
    });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }
  }
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const isPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    if (!isPost) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    const isChat = await prisma.chat.findMany({
      where: {
        postId: postId,
      },
    });

    for (const chat of isChat) {
      await prisma.chatMessages.deleteMany({
        where: {
          chatId: chat.id,
        },
      });
    }

    await prisma.chat.deleteMany({
      // work perfect
      where: {
        postId: postId,
      },
    });

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });
    return res.status(200).json({ message: "Post Deleted Successfully" });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { error, value } = postUpdate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }
    const userId = req.user.id;

    const { title, body, address, longitude, latitude, categoryId } = value;

    const postId = req.params.id;
    const isPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        user: true,
      },
    });
    if (!isPost) {
      return res.status(404).json({ message: "Post Not Found" });
    }

    if (isPost.user.id !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this post" });
    }

    if (categoryId !== undefined) {
      const isCategory = await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });
      if (!isCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
    }
    const updatePost = await prisma.post.update({
      where: {
        id: req.params.id,
      },
      data: {
        title: title,
        body: body,
        address: address,
        longitude: longitude,
        latitude: latitude,
        categoryId: categoryId,
      },
    });
    return res
      .status(201)
      .json({ message: "Post Updated Successfully", data: updatePost });
  } catch (error) {
    if (error.code === "P2023") {
      if (error.message.includes("Category")) {
        return res.status(404).json({ message: "Invalid Category Id format" });
      }
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.SpecificPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const isPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    if (!isPost) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    return res
      .status(200)
      .json({ message: "Post Fetched Successfully", data: isPost });
  } catch (error) {
    if (error.code === "P2023") {
      return res
        .status(404)
        .json({ message: "Post Id has not correct format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.allPosts = async (req, res) => {
  try {
    const today = new Date();

    today.setDate(today.getDate() - 30);

    const isPost = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    const isDelete = await prisma.post.deleteMany({
      where: {
        createdAt: {
          lt: today,
        },
      },
    });

    if (!isPost) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    return res
      .status(200)
      .json({ message: "Post Fetched Successfully", data: isPost });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPostsByUserId = async (req, res) => {
  try {
    const userId = req.user.id;

    const posts = await prisma.post.findMany({
      where: {
        userId: userId,
      },
    });
    if (posts.length === 0) {
      return res
        .status(404)
        .json({ message: "No posts found for the specified User" });
    }
    return res
      .status(200)
      .json({ message: "Post Fetched Successfully", data: posts });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPostsByCategoryId = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const posts = await prisma.post.findMany({
      where: {
        categoryId: categoryId,
      },
    });
    if (posts.length === 0) {
      return res
        .status(404)
        .json({ message: "No posts found for the specified category" });
    }
    return res
      .status(200)
      .json({ message: "Post Fetched Successfully", data: posts });
  } catch (error) {
    if (error.code === "P2023") {
      return res.status(404).json({ message: "Invalid Id format" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.specificDistance = async (req, res) => {
  try {
    const { error, value } = postRadius(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }
    const { userLat, userLon, distance } = value;
    const userId = req.user.id;
    function haversineDistance(lat1, lon1, lat2, lon2) {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const d = R * c; // in meters
      return d;
    }
    const posts = await prisma.post.findMany();
    let nearByPosts = posts.filter((post) => {
      const postDistance = haversineDistance(
        userLat,
        userLon,
        post.latitude,
        post.longitude
      );
      return postDistance <= distance;
    });

    nearByPosts = nearByPosts.filter((post)=> post.userId !== userId)

    return res.status(200).json({
      message: "Posts found within the specified distance",
      posts: nearByPosts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.SearchPosts = async (req, res) => {
  try {
    const postSearch = req.body.search;
    const isPost = await prisma.post.findMany({
      where: {
        OR: [
          {
            title: {
              contains: postSearch,
              mode: "insensitive",
            },
          },
          {
            body: {
              contains: postSearch,
              mode: "insensitive",
            },
          },
        ],
      },
    });
    if (isPost.length === 0) {
      return res
        .status(404)
        .json({ message: "No posts found matching your search." });
    }
    return res
      .status(200)
      .json({ message: "Post  Fetched Successfully", data: isPost });
  } catch (error) {
    console.log(error);
  }
};

exports.lastDays = async (req, res) => {
  try {
    const days = parseInt(req.params.days);
    if (isNaN(days) || days <= 0) {
      return res.status(400).json({ error: "Invalid number of days provided" });
    }
    const today = new Date();
    today.setDate(today.getDate() - days);
    const posts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const postsByCategory = {};
    posts.forEach((post) => {
      const categoryName = post.category.name;
      if (!postsByCategory[categoryName]) {
        postsByCategory[categoryName] = 1;
      } else {
        postsByCategory[categoryName]++;
      }
    });
    const response = {
      postsByCategory: postsByCategory,
      posts: posts,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching posts" });
  }
};
