import React, { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { getFirebase } from "../firebase";
import ReactMarkdown from 'react-markdown'
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai-sublime.css';

const Post = ({ match }) => {
  const slug = match.params.slug;
  const [loading, setLoading] = useState(true);
  const [currentPost, setCurrentPost] = useState();
  
  useEffect(() => { hljs.highlightAll(); })

  console.log('Hello');

  if (loading && !currentPost) {
    getFirebase()
      .database()
      .ref()
      .child(`/posts/${slug}`)
      .once("value")
      .then(snapshot => {
        if (snapshot.val()) {
          setCurrentPost(snapshot.val());
          console.log("Got it");
        }
        setLoading(false);
      });
  }

  if (loading) {
    return <h1>Loading...</h1>;
  }

  const postDoesNotExist = !currentPost;

  if (postDoesNotExist) {
    return <Redirect to="/404" />;
  }

  return (
    <>
      <div className="img-container">
        <img className='img-post' src={currentPost.coverImage} alt={currentPost.coverImageAlt} />
      </div>
      <h1>{currentPost.title}</h1>
      <em>{currentPost.datePretty}</em>
      <ReactMarkdown source={currentPost.content} />
    </>
  );
};

export default Post;
