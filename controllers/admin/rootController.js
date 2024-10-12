

export const renderAdminDashboard = async (req, res) => {
    try {
        res.render('./admin/admin')
    } catch (error) {
        res.send(error)
    }
}