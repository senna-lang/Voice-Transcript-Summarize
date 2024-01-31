import AddNewButton from "@/app/components/elements/AddNewButton";
import UserStatusButton from "@/app/components/elements/UserStatusButton";
import * as Vts from '@/app/features/VTS/components/index'
import { HiMiniArrowsPointingOut } from "react-icons/hi2";

const Sidebar = () => {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white px-5">
      <div className="my-12 flex items-center justify-center">
        <div className=" mr-1 text-4xl font-extrabold">VTS</div>
        <div className=" text-4xl font-extrabold text-blue-600">
          <HiMiniArrowsPointingOut />
        </div>
      </div>
      <AddNewButton />
      <Vts.TextList />
      <UserStatusButton />
      <Vts.FileDropModal />
      <Vts.FsModal />
    </div>
  );
};

export default Sidebar;
