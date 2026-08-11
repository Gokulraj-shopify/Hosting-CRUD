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
    const users = await db.collection("users").find().toArray();

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

    await db.collection("users").insertOne(
      {
        name,
      }
    );

    return null;
  }



   if (intent === "delete") {
    const id = formData.get("id");

    if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
      throw new Response("Invalid User ID:", { status: 400 });
    }

    await db.collection("users").deleteOne ( {
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

    await db.collection("users").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          name,
        },
      }
    );
    return
   }

} catch (error) {
  console.error("Action failed:", error);

  if (error instanceof Response) {
    throw error;
  }

  throw new Response("Database operation failed", {status: 500,});
}
}

export default function Home() {

  const {users} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to the Remix CRUD App</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <Form method="post" className="flex gap-3">
            <input type="hidden" name="intent" value="create" />
            <input 
              type="text" 
              name="name" 
              placeholder="Enter your name" 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button 
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
            >
              Submit
            </button>
          </Form>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <UserRow key={user._id} user={user} />
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No users yet. Create your first user above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
