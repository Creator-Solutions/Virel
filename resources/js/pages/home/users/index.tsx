import type { ReactNode } from "react";
import HomeLayout from "..";

const Users = () => {
  return <div>Users</div>;
};

Users.layout = (page: ReactNode) => <HomeLayout>{page}</HomeLayout>

export default Users;
