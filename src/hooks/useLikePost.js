import { useState } from "react";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useLikePost = (post) => {
  const [isUpdating, setisUpadating] = useState(false);
  const authUser = useAuthStore((state) => state.user);

  const [Likes, setLikes] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(post.likes.includes(authUser?.uid));
  const showToast = useShowToast();

  const handleLikePost = async () => {
    if (isUpdating) return;
    if (!authUser)
      return showToast(
        "Error",
        "You must be logged in to like a post",
        "error"
      );
    setisUpadating(true);

    try {
      const postRef = doc(firestore, "posts", post.id);
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
      });

      setIsLiked(!isLiked);
      isLiked ? setLikes(Likes - 1) : setLikes(Likes + 1);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setisUpadating(false);
    }
  };

  return { isLiked, Likes, handleLikePost, isUpdating };
};

export default useLikePost;
