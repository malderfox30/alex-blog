import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getFirebase } from "../firebase";
import Pagination from "react-js-pagination";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [blogPosts, setBlogPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 2;

  if (loading && !blogPosts.length) {
    getFirebase()
      .database()
      .ref("/posts")
      .orderByChild("dateFormatted")
      .once("value")
      .then(snapshot => {
        let posts = [];
        const snapshotVal = snapshot.val();
        for (let slug in snapshotVal) {
          posts.push(snapshotVal[slug]);
        }
        const newestFirst = posts.reverse();
        setBlogPosts(newestFirst);
        setLoading(false);
      });
  }

  var indexOfLastArticle = currentPage * articlesPerPage;
  var indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  var currentArticles = blogPosts.slice(indexOfFirstArticle, indexOfLastArticle);

  // // Logic for displaying page numbers
  // const pageNumbers = [];
  // for (let i = 1; i <= Math.ceil(blogPosts.length / articlesPerPage); i++) {
  //   pageNumbers.push(i);
  // }

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <h1>Blog posts</h1>
      { 
        currentArticles.map(blogPost => (
        <section key={blogPost.slug} className="card">
          <img src={blogPost.coverImage} alt={blogPost.coverImageAlt} />
          <div className="card-content">
            <h2>
              {blogPost.title} &mdash;{" "}
              <span style={{ color: "#5e5e5e" }}>{blogPost.datePretty}</span>
            </h2>
            <p
              dangerouslySetInnerHTML={{
                __html: `${blogPost.content.substring(0, 200)}...`
              }}
            ></p>
            <Link to={`/${blogPost.slug}`}>Continue reading...</Link>
          </div>
        </section>
      ))}
      {/* <ul id="page-numbers">
          {
            pageNumbers.map(number => {
              return (
                <li
                  key={number}
                  id={number}
                  onClick={() => setCurrentPage(number)}
                >
                  {number}
                </li>
              );
            })
          }
      </ul> */}
      <Pagination
        activePage={currentPage}
        itemsCountPerPage={articlesPerPage}
        totalItemsCount={blogPosts.length}
        pageRangeDisplayed={5}
        onChange={(pageNumber) => setCurrentPage(pageNumber)}
      />
    </>
  );
};

export default Home;
