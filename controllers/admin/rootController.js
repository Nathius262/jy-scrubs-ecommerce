

export const renderAdminDashboard = async (req, res) => {
    try {
        res.render('./admin/admin', {admin:true})
    } catch (error) {
        res.send(error)
    }
}