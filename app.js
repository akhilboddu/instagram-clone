
const firebaseAuthContainer = document.querySelector("#firebase-auth-container");
const mainContainer = document.querySelector("#main-container");
const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const postsDiv = document.querySelector(".posts");

const usernameInput = document.querySelector("#username");
const imageLinkInput = document.querySelector("#imagelink");
const captionInput = document.querySelector("#caption");
const createPostBtn = document.querySelector("#create-post-btn");
const editPostBtn = document.querySelector("#edit-post-btn");
const logoutBtn = document.querySelector("#logout-btn");
   editPostBtn.style.display = "none";

const editBtn = document.querySelector("#edit-btn");

const modal = new bootstrap.Modal(document.getElementById("modal"));
const showCreateModal = document.querySelector("#show-create-modal");

const ui = new firebaseui.auth.AuthUI(auth);

// Rest of the code (redirectToAuth, redirectToApp, handleLogout, and auth.onAuthStateChanged) goes here

const redirectToAuth = () => {
  mainContainer.style.display = "none";
  firebaseAuthContainer.style.display = "block";

  ui.start("#firebase-auth-container", {
    callbacks: {
      signInSuccessWithAuthResult: (authResult, redirectUrl) => {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        console.log("authResult", authResult.user.uid);
        // this.userId = authResult.user.uid;
        // this.$authUserText.innerHTML = user.displayName;
        redirectToApp();
      },
    },
    signInOptions: [
      firebaseui.auth.EmailAuthProvider.PROVIDER_ID,
      firebaseui.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
    // Other config options...
  });
};

const redirectToApp = () => {
  mainContainer.style.display = "block";
  firebaseAuthContainer.style.display = "none";
};

const handleLogout = () => {
  auth
    .signOut()
    .then(() => {
      console.log("USER SIGNED OUT");
      redirectToAuth();
    })
    .catch((error) => {
      console.log("ERROR OCCURRED", error);
    });
};

 onAuthStateChanged((user) => {
    if (user) {
      console.log(user.uid);
      // this.userId = user.uid;
      // this.$authUserText.innerHTML = user.displayName;
      redirectToApp();
    } else {
      console.log("not loggedin");
      redirectToAuth();
    }
  });

// Event Listeners
searchBtn.addEventListener("click", () => {
  console.log(searchInput.value);
  searchInput.style.background = "red";
});
createPostBtn.addEventListener("click", () => {
  console.log("create post btn clicked");
  createPost(imageLinkInput.value, captionInput.value, usernameInput.value);
});
showCreateModal.addEventListener("click", () => {
  isEditMode = false;
  createPostBtn.style.display = "block";
  editPostBtn.style.display = "none";
  usernameInput.value = "";
  imageLinkInput.value = "";
  captionInput.value = "";
  modal.show();
});
editPostBtn.addEventListener("click", () => {
  console.log("edit post btn clicked");
  updatePost(postToEditId, imageLinkInput.value, captionInput.value);
  modal.hide();
});
logoutBtn.addEventListener("click", () => {
  handleLogout();
});


var feed = [];
var isEditMode = false;
var postToEditId = null;

const uploadPostToFirebase = (post) => {
  db.collection("posts")
    .doc(post.id + "")
    .set(post)
    .then(() => {
      console.log("POST UPLOADED TO FIREBASE");
    })
    .catch((error) => {
      console.log("ERROR", error);
    });
};

const getPostsFromFirebase = () => {
  db.collection("posts")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.data());
        feed.push(doc.data());
        outputFeed();
      });
    });
};



const createPost = (imageLink, caption, username) => {
  const newPost = {
    id: feed.length,
    username: username,
    imageLink: imageLink,
    caption: caption,
    likes: 0,
    comments: [],
    shares: 0,
    isPublic: true,
    createdAt: new Date(),
  };
  console.log("FEED", feed);
  uploadPostToFirebase(newPost);
  feed.push(newPost);
  outputFeed();
  modal.hide();
 
};

const outputFeed = () => {
 
  const updatedFeed = feed.map((post) => {
    return `
    <div class="post">
      <div class="post-header">
          <p>${post.username}</p>
          <button class="btn btn-sm btn-primary" onclick="showEditPostModal(${post.id})">Edit</button>
      </div>
      <img src="${post.imageLink}" alt="">
      <div class="caption">
          <p>${post.caption}</p>
      </div>
    </div>
    `;
  });
  postsDiv.innerHTML = updatedFeed.join(" ");
};


const updatePost = (id, newImageLink, newCaption) => {


  const updatedFeed = feed.map((post) => {
    if (post.id === id) {
      post.imageLink = newImageLink;
      post.caption = newCaption;
    }
    return post;
  });
  feed = updatedFeed;
  uploadPostToFirebase(feed[id]);
  outputFeed();
};


const deletePost = (id) => {

  const updatedFeed = feed.filter((post) => {
    if (post.id !== id) {
      return post;
    }
  });
  feed = updatedFeed;
  // outputFeed(feed);
};

const outputPostStatus = (post) => {
  const output = `
  POST INFO:
  ID: ${post.id}
  Username: ${post.username}
  Image Link: ${post.imageLink}
  Caption: ${post.caption}
  `;
  return output;
};

const showEditPostModal = (id) => {
  postToEditId = id;
  isEditMode = true;
  createPostBtn.style.display = "none";
  editPostBtn.style.display = "block";
  const postToEdit = feed[id];
  console.log("postToEdit", postToEdit);
  usernameInput.value = postToEdit.username;
  imageLinkInput.value = postToEdit.imageLink;
  captionInput.value = postToEdit.caption;
  modal.show();
};

outputFeed();
getPostsFromFirebase();
outputFeed(feed);
