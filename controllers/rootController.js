
export const index_view = async (req, res) => {
    const context = {
        title: "Jy-Scurbs Home"
    }
    return res.render('./layouts/index', context)
}