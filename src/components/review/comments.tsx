"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@/hooks/convex";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function Comments({ applicationId }: { applicationId: string }) {
  const session = authClient.useSession();
  const userId = session.data?.user?.id;
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [deletingId, setDeletingId] = useState<Id<"applicationComments"> | null>(null);

  const comments = useQuery(api.fn.review.getApplicationComments, {
    applicationId: applicationId as Id<"application">,
  });
  const addComment = useMutation(api.fn.review.addApplicationComment);
  const deleteComment = useMutation(api.fn.review.deleteApplicationComment);

  const orderedComments = useMemo(() => {
    if (!comments) return [];
    return comments.sort((a, b) => b.createdAt - a.createdAt);
  }, [comments]);

  const handleAddComment = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await addComment({
        applicationId: applicationId as Id<"application">,
        content: trimmed,
      });
      setContent("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: Id<"applicationComments">) => {
    setDeletingId(commentId);
    try {
      await deleteComment({ commentId });
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          Comments
        </CardTitle>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="text-[10px] tracking-wider uppercase"
          onClick={() => setShowReplyForm((value) => !value)}
        >
          {showReplyForm ? "Close" : "New comment"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showReplyForm && (
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Leave context for other reviewers..."
              className="min-h-24"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={isSubmitting || content.trim().length === 0}
              >
                Add comment
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {comments === undefined ? (
            <p className="text-sm text-muted-foreground">Loading comments...</p>
          ) : orderedComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            orderedComments.map((comment) => (
              <div
                key={comment._id}
                className="rounded-md border border-border bg-card/50 p-3"
              >
                <div className="mb-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Avatar size="sm">
                    <AvatarImage src={comment.author?.image ?? undefined} />
                    <AvatarFallback>{comment.author?.name?.charAt(0) ?? comment.authorId.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-mono text-sm">{comment.author?.name ?? comment.authorId}</span>
                  <span>&bull;</span>
                  <span>{formatTime(comment.createdAt)}</span>
                  {comment.authorId === userId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="ml-auto text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteComment(comment._id)}
                      disabled={deletingId === comment._id}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 