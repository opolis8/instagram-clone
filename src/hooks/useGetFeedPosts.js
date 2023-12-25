import React, { useEffect, useState } from "react";
import usePostStore from "../store/postStore";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetFeedPosts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { posts, setPosts } = usePostStore();

  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();
  const { setUserProfile } = useUserProfileStore();

  useEffect(() => {
    const getFeedPosts = async () => {
      setIsLoading(true);
      if (authUser.following.length === 0) {
        setIsLoading(false);
        setPosts([]);
        return;
      }

      const q = query(
        collection(firestore, "posts"),
        where("createdBy", "in", authUser.following)
      );
      try {
        const querySnapshot = await getDocs(q);

        const FeedPosts = [];

        querySnapshot.forEach((doc) => {
          FeedPosts.push({ id: doc.id, ...doc.data() });
        });

        FeedPosts.sort((a, b) => b.createdAt - a.createdAt);

        setPosts(FeedPosts);
      } catch (error) {
        showToast("Error", error.messsage, "error");
      } finally {
        setIsLoading(false);
      }
    };
    if (authUser) getFeedPosts();
  }, [authUser, showToast, setPosts, setUserProfile]);

  return { isLoading, posts };
};

export default useGetFeedPosts;
