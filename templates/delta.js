module.exports = function (delta) {
    if(!delta) return "";

    const color = delta.isPositive ? "green" : "red";

    return "<span style='color:" 
        + color 
        + "'>("
        + (delta.isPositive ? "+" : "-")
        + (delta ? delta.value : 0)
        + ")</span>";
};