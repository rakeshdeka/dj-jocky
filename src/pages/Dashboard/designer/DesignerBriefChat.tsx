import BriefGroupChat from "../shared/BriefGroupChat"

const DesignerBriefChat = () => (
  <BriefGroupChat
    backPath="/designer/briefs"
    backLabel="Briefs"
    showScheduleMeet={false}
    canCompose={false}
  />
)

export default DesignerBriefChat
