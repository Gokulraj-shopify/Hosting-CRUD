import type {Route} from "./+types/home";
import {Form, useLoaderData} from "react-router";
import UserRow from "../components/UserRow";
import {ObjectId} from "mongodb";
import {db} from "../lib/mongodb.server";

type User = {
  _id: string,
  name: string,
}

export async function loader(): Promise<{ users: User[] }> {
  try {
    const usersCollection = await db.collection("users");
    const users = await usersCollection.find().toArray();

    const formattedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toHexString(),
    })) as User[];

    return {
      users: formattedUsers,
    };
  }
  catch(error) {
    console.error("Failed to load users:", error);
    throw new Response("Failed to load users", { status: 500 });
  }
}

export async function action({request}: Route.ActionArgs) {
 try {
  const formData = await request.formData();

  const intent = formData.get("intent");

  if (intent === "create") {
    const name = formData.get("name");

    if (!name || typeof name !== "string") {
      throw new Response("Name is required", { status: 400 });
    }

    const usersCollection = await db.collection("users");
    await usersCollection.insertOne({
      name,
    });

    return null;
  }

   if (intent === "delete") {
    const id = formData.get("id");

    if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
      throw new Response("Invalid User ID:", { status: 400 });
    }

    const usersCollection = await db.collection("users");
    await usersCollection.deleteOne({
      _id: new ObjectId(id),
    });
    return null;
   }

   if (intent === "update") {
    const id = formData.get("id");
    const name = formData.get("name");

    if(!id || typeof id !== "string" || !ObjectId.isValid(id)) {
      throw new Response("Invalid User ID:", { status: 400 });
    }

    if (!name || typeof name !== "string") {
      throw new Response("Name is required", { status: 400 }); 
    }

    const usersCollection = await db.collection("users");
    await usersCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          name,
        },
      }
    );
    return null;
   }

} catch (error) {
  console.error("Action failed:", error);

  if (error instanceof Response) {
    throw error;
  }

  throw new Response("Database operation failed", {status: 500,});
}
}
}

export default function Home() {

  const {users} = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Welcome to the Remix CRUD App</h1>

      <Form method="post">
        <input type="hidden" name="intent" value="create" />
        <input type="text" name="name" placeholder="Enter your name" />
        <button type="submit">Submit</button>
      </Form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user._id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
