const allGoals = Array.from(document.querySelectorAll(".bucket-item"));
console.log(allGoals);
const completedGoals = allGoals.filter((goal) => {
  const status = goal
    .querySelector(".completed-status")
    ?.textContent.trim()
    .toLowerCase();
  return status === "true";
});
const completedPercentage = (completedGoals.length / allGoals.length) * 100;
console.log(`Completed: ${completedPercentage.toFixed(1)}%`);

document.querySelector(".progress").textContent =
  completedPercentage.toFixed(1) + "% Complete";
