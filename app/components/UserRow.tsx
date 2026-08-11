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
        <tr>
            <td>
                {isEditing ? (
                    <fetcher.Form method="post">
                        <input type="hidden" name="intent" value="update" />
                        <input type="hidden" name="id" value={user._id}/>
                        <input type="text" name="name" value={name} onChange= {(e) => setName(e.target.value)}/>
                        <button type="submit" disabled={isBusy}>{isBusy ? "Saving..." : "Save"}</button>
                        <button type="button" onClick={() => { setName(user.name); setIsEditing(false); }} disabled={isBusy}>Cancel</button>
                    </fetcher.Form>
                ) : (
                    <>
                        <span>
                            {user.name}
                        </span>
                        <button onClick={() => setIsEditing(true)}
                        disabled={isBusy}>Edit </button>
                    </>
                )
                }
            </td>

            <td>
                <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={user._id}/>

                    <button type="submit" disabled={isBusy}>Delete</button>
                </fetcher.Form>
            </td>
        </tr>
    );
}
