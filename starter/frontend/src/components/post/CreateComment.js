import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { comment } from "../../functions/post";
import dataURItoBlob from "../../helpers/dataURItoBlob";
import { uploadImages } from "../../functions/uploadImages";
import { ClipLoader } from "react-spinners";

export default function CreateComment({ user, postId, setComments, setCount }) {
  const [picker, setPicker] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [commentImage, setCommentImage] = useState("");
  const [cursorPosition, setCursorPosition] = useState();
  const textRef = useRef(null);
  const imgInput = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    textRef.current.selectionEnd = cursorPosition;
  }, [cursorPosition]);

  const handleEmoji = (emojiData) => {
    const ref = textRef.current;
    ref.focus();
    const start = text.substring(0, ref.selectionStart);
    const end = text.substring(ref.selectionStart);
    const newText = start + emojiData.emoji + end;
    setText(newText);
    setCursorPosition(start.length + emojiData.emoji.length);
  };

  const handleImage = (e) => {
    let file = e.target.files[0];
    //console.log(file.type);

    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png" &&
      file.type !== "image/gif" &&
      file.type !== "image/webp" &&
      file.type !== "image/jfif" &&
      file.type !== "image/raw" &&
      file.type !== "image/bmp"
    ) {
      setError(`${file.name} format is not supported.`);
      return;
    } else if (file.size > 1024 * 1024 * 5) {
      setError(`${file.name} is too large, max 5mb is allowed.`);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      setCommentImage(event.target.result);
    };
  };
  const handleComment = async (e) => {
    if (e.key === "Enter") {
      if (commentImage != "") {
        setLoading(true);
        const img = dataURItoBlob(commentImage);
        const path = `${user.username}/post_images/${postId}`;
        let formData = new FormData();
        formData.append("path", path);
        formData.append("file", img);
        const imgComment = await uploadImages(formData, path, user.token);
        const comments = await comment(
          postId,
          text,
          imgComment[0].url,
          user.token
        );
        setComments(comments);
        setCount((prev) => ++prev);
        setLoading(false);
        setText("");
        setCommentImage("");
      } else {
        setLoading(true);
        const comments = await comment(postId, text, "", user.token);
        setComments(comments);
        setCount((prev) => ++prev);
        setLoading(false);
        setText("");
        setCommentImage("");
      }
    }
  };
  return (
    <div className="create_comment_wrap">
      <div className="create_comment">
        <img src={user?.picture} alt="" />
        <div className="comment_input_wrap">
          <div className="comment_emoji_picker">
            {picker && <EmojiPicker onEmojiClick={handleEmoji} />}
          </div>
          <input
            type="file"
            hidden
            ref={imgInput}
            accept="image/*"
            onChange={handleImage}
          />

          {error && (
            <div className="postError comment_error">
              <div className="postError_error">{error}</div>
              <button
                className="blue_btn"
                onClick={() => {
                  setError("");
                }}
              >
                Try again
              </button>
            </div>
          )}

          <input
            type="text"
            ref={textRef}
            value={text}
            placeholder="Write a comment..."
            onChange={(e) => setText(e.target.value)}
            onKeyUp={handleComment}
          />
          <div className="comment_circle" style={{ marginTop: "5px" }}>
            <ClipLoader size={20} color="#1876f2" loading={loading} />
          </div>
          <div
            className="comment_circle_icon hover2"
            onClick={() => {
              setPicker((prev) => !prev);
            }}
          >
            <i className="emoji_icon"></i>
          </div>
          <div
            className="comment_circle_icon hover2"
            onClick={() => imgInput.current.click()}
          >
            <i className="camera_icon"></i>
          </div>
          <div className="comment_circle_icon hover2">
            <i className="gif_icon"></i>
          </div>
          <div className="comment_circle_icon hover2">
            <i className="sticker_icon"></i>
          </div>
        </div>
      </div>
      {commentImage && (
        <div className="comment_img_preview">
          <img src={commentImage} alt="" />
          <div
            className="small_white_circle"
            onClick={() => {
              setCommentImage("");
            }}
          >
            <i className="exit_icon"></i>
          </div>
        </div>
      )}
    </div>
  );
}
