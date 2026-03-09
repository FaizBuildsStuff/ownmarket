import AdminHeader from "@/components/adminheader"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AdminHeader />
      {children}
    </>
  )
}

export default Layout