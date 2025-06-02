export async function findUser() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) {
    console.log("[ERROR] Unable to login user", authError);
    throw new Error("Error login in ", authError.message);
  }
  return user;
}

export async function getAllGoals(supabase, user) {
  const { data: goals, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id);
  if (error) {
    console.log("[ERROR] Unable to fetch goals:", error);
    throw new Error("Error fetching all goals: " + error.message);
  }
  if (
    goals === null ||
    (Array.isArray(goals) && goals.length === 0) ||
    !Array.isArray(goals)
  ) {
    return { data: [], error: null };
  }

  return { data: goals, error: null };
}

export async function getAllGoals1(page = 1, limit = 10) {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data, error, count } = await supabase
    .from("goals")
    .select("*", { count: "exact" }) // count is optional but helpful
    .range(start, end);

  if (error)
    throw new Error("Error fetching paginated goals: " + error.message);

  return {
    data,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  };
}

export async function getGoalById(supabase, id) {
  const { data, error } = await supabase.from("goals").select("*").eq("id", id);
  if (error) {
    console.log("[ERROR] Goal not found:", error);
    throw new Error("Goal not found " + error.message);
  }
  return data;
}

export async function deleteGoal(supabase, id) {
  const { data: deletedGoal, error } = await supabase
    .from("goals")
    .delete("*")
    .eq("id", id);
  if (error) {
    console.log("[ERROR] Unable to delete goal");
    throw new Error("Goal not deleted " + error.message);
  }
  return { data: deletedGoal, error: null };
}

export async function createGoal(supabase, goal, user) {
  const { data: createdGoal, error } = await supabase
    .from("goals")
    .insert([
      {
        title: goal.title?.trim(),
        category: goal.category?.trim(),
        completed: false,
        user_id: user.id,
      },
    ])
    .select(); // get inserted row(s) back
  if (!createdGoal || createdGoal.length === 0) {
    console.log("[ERROR] Unable to create goal");
    // Handle unique constraint errors more clearly
    if (error.message.includes("duplicate key")) {
      throw new Error("A goal with this title already exists.");
    }
    throw new Error("Goal not created : " + error.message);
  }
  return { data: createdGoal, error: null };
}

export async function updateGoal(supabase, goal, user) {
  const { data: updatedGoal, error } = await supabase
    .from("goals")
    .update([
      {
        title: goal.title,
        category: goal.category,
        completed: Boolean(goal.completed),
      },
    ])
    .eq("id", goal.id);
  if (error) {
    console.log("[ERROR] Unable to update goal");
    throw new Error("Goal not updated : " + error.message);
  }
  return { data: updatedGoal, error: null };
}
