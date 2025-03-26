package trippingactual.server.RestControllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import trippingactual.server.services.MetricsService;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "https://tripping-app.com/", // Allowed origin
        allowCredentials = "false" // No need to allow credentials for Authorization header)
) // Allowed origin
public class MetricsController {

    @Autowired
    private MetricsService metricsService;

    public MetricsController(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @PostMapping("/user-login")
    public void userLoggedIn() {
        System.out.println("user login detected, incrementing");
        metricsService.userLoggedIn();
    }

    @PostMapping("/user-logout")
    public void userLoggedOut() {
        System.out.println("user logout detected, decrementing");
        metricsService.userLoggedOut();
    }
}