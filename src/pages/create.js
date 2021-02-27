import React, { useState, useRef } from "react";
import { getFirebase } from "../firebase";
import md from './md';
import { useDropzone } from 'react-dropzone';
import FileReader from 'promise-file-reader';
import 'semantic-ui-css/semantic.min.css'
import { Icon } from 'semantic-ui-react';
import getConfig from './config';
import 'react-textarea-markdown-editor/build/TextareaMarkdownEditor.css';
import TextareaMarkdownEditor from 'react-textarea-markdown-editor';

const labelStyles = {
  display: "block",
  marginBottom: 4
};

const inputStyles = {
  width: "100%",
  height: "2rem",
  lineHeight: "2rem",
  verticalAlign: "middle",
  fontSize: "1rem",
  marginBottom: "1.5rem",
  padding: "0 0.25rem"
};

const Create = ({ history }) => {
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const editorRef = useRef(null);
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    // Disable click and keydown behavior
    noClick: true,
    noKeyboard: true,
    multiple: false,
    accept: 'image/jpeg, image/png',
    onDropAccepted: async (files) => {
      const data = await FileReader.readAsDataURL(files[0]);
      editorRef.current.mark('![', `][image${images.length + 1}]`, 'alt text');
      setImages([...images, data]);
    },
  });

  const markers = [
    ...getConfig('en'),
    {
      key: 'images',
      markers: [
        {
          key: 'images',
          markers: [
            {
              key: 'open',
              name: <Icon name="image" fitted size="large" onClick={open}/>,
              title: 'Open file',
              type: 'component',
            },
            ...images.map((data, index) => ({
              defaultText: 'alt text',
              key: `image${index + 1}`,
              name: `image${index + 1}`,
              prefix: '![',
              suffix: `][image${index + 1}]`,
              title: `image${index + 1}`,
              type: 'marker',
            })),
          ],
          type: 'dropdown',
        },
      ],
    },
  ];

  async function onPaste (e) {
    if (!e.clipboardData) {
      return;
    }
    const items = e.clipboardData.items;
    if (!items) {
      return;
    }
    for (let i = 0; i < items.length; i++) {
      // Skip content if not image
      if (items[i].type.indexOf('image') === -1) continue;
      // Retrieve image on clipboard as blob
      const file = items[i].getAsFile();
      console.log(items[i]);
      if (file) {
        e.preventDefault();
        e.stopPropagation();
        // File name
        console.log(e.clipboardData.getData('Text'));
        const data = await FileReader.readAsDataURL(file);
        console.log(data);
        editorRef.current.mark('![', `][image${images.length + 1}]`, 'alt text');
        setImages([...images, data]);
      }
    }
  }

  const generateDate = () => {
    const now = new Date();
    const options = { month: "long", day: "numeric", year: "numeric" };
  
    const year = now.getFullYear();
  
    let month = now.getMonth() + 1;
    if (month < 10) {
      month = `0${month}`; // prepend with a 0
    }
  
    let day = now.getDate();
    if (day < 10) {
      day = `0${day}`; // prepend with a 0
    }
  
    return {
      formatted: `${year}-${month}-${day}`,             // used for sorting
      pretty: now.toLocaleDateString("en-US", options)  // used for displaying
    };
  };

  const generateSlug = (title) => {
    return title.split(" ")
                .join("-")
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/Đ/g, 'D');
  }

  const createPost = () => {
    const date = generateDate();
    const slug = generateSlug(title);
    const newPost = {
      title,
      dateFormatted: date.formatted,
      datePretty: date.pretty,
      slug,
      coverImage,
      coverImageAlt,
      content
    };
    getFirebase()
      .database()
      .ref()
      .child(`posts/${slug}`)
      .set(newPost)
      .then(() => history.push(`/`));
  };

  return (
    <>
      <h1>Create a new post</h1>
      <section style={{ margin: "2rem 0" }}>
        <label style={labelStyles} htmlFor="title-field">
          Title
        </label>
        <input
          style={inputStyles}
          id="title-field"
          type="text"
          value={title}
          onChange={({ target: { value } }) => {
            setTitle(value);
          }}
        />

        <label style={labelStyles} htmlFor="cover-image-field">
          Cover image
        </label>
        <input
          style={inputStyles}
          id="cover-image-field"
          type="text"
          value={coverImage}
          onChange={({ target: { value } }) => {
            setCoverImage(value);
          }}
        />

        <label style={labelStyles} htmlFor="cover-image-alt-field">
          Cover image alt
        </label>
        <input
          style={inputStyles}
          id="cover-image-alt-field"
          type="text"
          value={coverImageAlt}
          onChange={({ target: { value } }) => {
            setCoverImageAlt(value);
          }}
        />

        <label style={labelStyles} htmlFor="content-field">
          Content
        </label>
  
        <TextareaMarkdownEditor 
          id='content'
          value={content}
          onChange={(value) => setContent(value)}
          doParse={text => md.render(`${text}\n\n${images.map((data, index) => `[image${index + 1}]: ${data}`).join('\n\n')}`)}
          ref={editorRef} 
          markers={markers}
          rows={10}
          placeholder="You can paste or drag your image here!"
          onPaste={onPaste}
        />

        <div style={{ textAlign: "right" }}>
          <button
            style={{
              border: "none",
              color: "#fff",
              backgroundColor: "#039be5",
              borderRadius: "4px",
              padding: "8px 12px",
              fontSize: "0.9rem"
            }}
            onClick={createPost}
          >
            Create
          </button>
        </div>
      </section>
    </>
  );
};

export default Create;