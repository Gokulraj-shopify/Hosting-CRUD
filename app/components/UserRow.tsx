import {useFetcher} from "react-router";
import {useState, useEffect} from "react";

type User = {
    _id: string,
    name: string,
};

type UserRowProps = {
    user: User,

};

export default function UserRow({user}: UserRowProps) {
    const fetcher = useFetcher ();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name);

    const isBusy = fetcher.state !== "idle";

    useEffect(() => {
        if (fetcher.state === "idle") {
            setIsEditing(false);
        }
    }, [fetcher.state]);

    return (
        <tr className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-6 py-4">
                {isEditing ? (
                    <fetcher.Form method="post" className="flex gap-2">
                        <input type="hidden" name="intent" value="update" />
                        <input type="hidden" name="id" value={user._id}/>
                        <input 
                            type="text" 
                            name="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                        <button 
                            type="submit" 
                            disabled={isBusy}
                            className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {isBusy ? "Saving..." : "Save"}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { setName(user.name); setIsEditing(false); }} 
                            disabled={isBusy}
                            className="px-3 py-1 bg-gray-400 text-white text-sm font-medium rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            Cancel
                        </button>
                    </fetcher.Form>
                ) : (
                    <>
                        <span className="text-gray-900 font-medium">
                            {user.name}
                        </span>
                        <button 
                            onClick={() => setIsEditing(true)}
                            disabled={isBusy}
                            className="float-right px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            Edit
                        </button>
                    </>
                )
                }
            </td>

            <td className="px-6 py-4">
                <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={user._id}/>

                    <button 
                        type="submit" 
                        disabled={isBusy}
                        className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        Delete
                    </button>
                </fetcher.Form>
            </td>
        </tr>
    );
}
