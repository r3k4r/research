// Mock API functions to simulate server requests

export const fetchDashboardStats = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalUsers: 1248,
        totalFoodItems: 583,
        totalRevenue: 52750,
        growthRate: 15.8,
      });
    }, 800);
  });
};

export const fetchSalesData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Sales",
            data: [12800, 19400, 15200, 25600, 22300, 30100],
            borderColor: "rgb(99, 102, 241)",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            tension: 0.3,
            fill: true,
          },
        ],
      });
    }, 1000);
  });
};

export const fetchUserGrowthData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "New Users",
            data: [56, 85, 124, 168, 214, 264],
            backgroundColor: "rgba(16, 185, 129, 0.7)",
            hoverBackgroundColor: "rgba(16, 185, 129, 0.9)",
            borderRadius: 4,
          },
        ],
      });
    }, 1200);
  });
};

export const fetchGenderData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        labels: ["Male", "Female", "Other"],
        datasets: [
          {
            data: [58, 37, 5],
            backgroundColor: [
              "rgba(37, 99, 235, 0.7)", 
              "rgba(236, 72, 153, 0.7)",
              "rgba(107, 114, 128, 0.7)"
            ],
            borderWidth: 0,
          },
        ],
      });
    }, 1000);
  });
};

export const fetchTopRestaurants = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: "Pizza Palace", customers: 578, revenue: 15840 },
        { name: "Burger Bliss", customers: 452, revenue: 12340 },
        { name: "Sushi Supreme", customers: 412, revenue: 18650 },
        { name: "Taco Town", customers: 368, revenue: 9240 },
        { name: "Pasta Paradise", customers: 316, revenue: 11280 },
      ]);
    }, 900);
  });
};
