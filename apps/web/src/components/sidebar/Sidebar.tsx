import { createClient } from "@/lib/supabase/server"

import SidebarClient from "./SidebarClient"

export default async function Sidebar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userProfile = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    userProfile = data
  }

  return <SidebarClient userProfile={userProfile} />
}
