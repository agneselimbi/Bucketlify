const editLinks = document.querySelectorAll(".edit-goal");
const deleteLinks = document.querySelectorAll(".delete-goal");

editLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const row = e.target.closest("tr");
    const id = row.querySelector(".goal-id").textContent.trim();
    const title = row.querySelector(".goal-title").textContent.trim();
    const category = row.querySelector(".goal-category").textContent.trim();
    const completedText = row.querySelector(".goal-completed").value.trim();
    const completed = completedText.toLowerCase() === "true";

    const url = `/bucket-item?id=${id}&title=${encodeURIComponent(
      title
    )}&category=${encodeURIComponent(category)}&completed=${encodeURIComponent(
      completed
    )}`;

    fetch(url, {
      method: "GET",
    })
      .then((res) => res.text())
      .then((html) => {
        window.location.href = url;
      })
      .catch((error) => console.log(error));
  });
});

deleteLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const row = e.target.closest("tr");
    const id = row.querySelector(".goal-id").textContent.trim();
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmed) return;
    const url = `/bucket-item?id=${id}`;
    fetch(url, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete");
        row.classList.add("fade-out");
        setTimeout(() => row.remove(), 300);
      })
      .catch((error) => console.log(error));
    // // .then((res) => {
    //   if (!res.ok) throw new Error("Failed to delete");
    //   row.classList.add("fade-out");
    //   setTimeout(() => row.remove(), 300); // Wait for fade to finish
    //   //window.location.href = "/admin"; // Change to your actual listing page
    // })
    // .catch((error) => console.log(error));
  });
});
