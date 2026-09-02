import { create } from "zustand";

export interface PostAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
  title: string;
  location?: string;
  primaryStack?: string[];
}

export interface PostComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    title?: string;
  };
  likeCount: number;
  isLiked: boolean;
  isOwner?: boolean;
  replies?: PostComment[];
}

export interface PostItem {
  id: string;
  content: string;
  mediaUrls: string[];
  codeSnippet?: string | null;
  codeLanguage?: string | null;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  project?: {
    id: string;
    title: string;
    stage: string;
  } | null;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isOwner: boolean;
  previewComments: PostComment[];
}

export interface CreatePostPayload {
  content: string;
  mediaUrls?: string[];
  codeSnippet?: string;
  codeLanguage?: string;
  tags?: string[];
  category?: string;
  projectId?: string;
}

interface PostState {
  posts: PostItem[];
  activeCategory: string;
  selectedTag: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  setActiveCategory: (cat: string) => void;
  setSelectedTag: (tag: string | null) => void;
  fetchPosts: (category?: string, tag?: string) => Promise<void>;
  createPost: (payload: CreatePostPayload) => Promise<boolean>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string, parentId?: string) => Promise<boolean>;
  toggleCommentLike: (postId: string, commentId: string) => Promise<void>;
  toggleBookmark: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<boolean>;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  activeCategory: "ALL",
  selectedTag: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  setActiveCategory: (cat) => {
    set({ activeCategory: cat });
    get().fetchPosts(cat, get().selectedTag || undefined);
  },

  setSelectedTag: (tag) => {
    set({ selectedTag: tag });
    get().fetchPosts(get().activeCategory, tag || undefined);
  },

  fetchPosts: async (category, tag) => {
    try {
      set({ isLoading: true, error: null });
      const currentCat = category || get().activeCategory;
      const currentTag = tag || get().selectedTag;

      const params = new URLSearchParams();
      if (currentCat && currentCat !== "ALL") params.append("category", currentCat);
      if (currentTag) params.append("tag", currentTag);

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat postingan komunitas");

      const data = await res.json();
      set({ posts: data.posts || [], isLoading: false });
    } catch (err: any) {
      console.error("fetchPosts error:", err);
      set({ isLoading: false, error: err.message });
    }
  },

  createPost: async (payload) => {
    try {
      set({ isSubmitting: true, error: null });
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal membagikan postingan");
      }

      const newPost = await res.json();
      set((state) => ({
        posts: [newPost, ...state.posts],
        isSubmitting: false,
      }));
      return true;
    } catch (err: any) {
      console.error("createPost error:", err);
      set({ isSubmitting: false, error: err.message });
      return false;
    }
  },

  toggleLike: async (postId) => {
    const currentPosts = get().posts;
    const postIndex = currentPosts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;

    const post = currentPosts[postIndex];
    const newIsLiked = !post.isLiked;
    const newLikeCount = newIsLiked ? post.likeCount + 1 : Math.max(0, post.likeCount - 1);

    // Optimistic UI Update
    const updated = [...currentPosts];
    updated[postIndex] = {
      ...post,
      isLiked: newIsLiked,
      likeCount: newLikeCount,
    };
    set({ posts: updated });

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) {
        set({ posts: currentPosts });
      }
    } catch {
      set({ posts: currentPosts });
    }
  },

  addComment: async (postId, content, parentId) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });

      if (!res.ok) return false;

      const newComment = await res.json();

      set((state) => ({
        posts: state.posts.map((p) => {
          if (p.id !== postId) return p;

          if (parentId) {
            // Append as nested reply
            return {
              ...p,
              commentCount: p.commentCount + 1,
              previewComments: p.previewComments.map((c) =>
                c.id === parentId
                  ? { ...c, replies: [...(c.replies || []), newComment] }
                  : c
              ),
            };
          }

          // Append as root comment
          return {
            ...p,
            commentCount: p.commentCount + 1,
            previewComments: [...(p.previewComments || []), newComment],
          };
        }),
      }));
      return true;
    } catch (err) {
      console.error("addComment error:", err);
      return false;
    }
  },

  toggleCommentLike: async (postId, commentId) => {
    const currentPosts = get().posts;
    const post = currentPosts.find((p) => p.id === postId);
    if (!post) return;

    const updateCommentLike = (comment: PostComment): PostComment => {
      if (comment.id === commentId) {
        const nextIsLiked = !comment.isLiked;
        return {
          ...comment,
          isLiked: nextIsLiked,
          likeCount: nextIsLiked ? comment.likeCount + 1 : Math.max(0, comment.likeCount - 1),
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: comment.replies.map(updateCommentLike),
        };
      }
      return comment;
    };

    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              previewComments: p.previewComments.map(updateCommentLike),
            }
          : p
      ),
    }));

    try {
      await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    } catch {
      set({ posts: currentPosts });
    }
  },

  toggleBookmark: async (postId) => {
    const currentPosts = get().posts;
    const postIndex = currentPosts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;

    const post = currentPosts[postIndex];
    const newIsBookmarked = !post.isBookmarked;

    const updated = [...currentPosts];
    updated[postIndex] = {
      ...post,
      isBookmarked: newIsBookmarked,
      bookmarkCount: newIsBookmarked ? post.bookmarkCount + 1 : Math.max(0, post.bookmarkCount - 1),
    };
    set({ posts: updated });

    try {
      const res = await fetch(`/api/posts/${postId}/bookmark`, { method: "POST" });
      if (!res.ok) set({ posts: currentPosts });
    } catch {
      set({ posts: currentPosts });
    }
  },

  deletePost: async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) return false;

      set((state) => ({
        posts: state.posts.filter((p) => p.id !== postId),
      }));
      return true;
    } catch (err) {
      console.error("deletePost error:", err);
      return false;
    }
  },
}));
