import BriefGroupChat from "../shared/BriefGroupChat"

const AdminProjectChat = () => (
  <BriefGroupChat
    backPath="/admin/projects"
    backLabel="Projects"
    showScheduleMeet
    canCompose
    meetingsPath="/admin/meetings"
  />
)

export default AdminProjectChat
