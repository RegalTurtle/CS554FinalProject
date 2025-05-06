"use client";

import { logout } from "@/src/app/user/actions";
export default function profile() {
    return (
        <div>
            <button onClick={() => logout()}>Logout</button>
        </div>
    );
}