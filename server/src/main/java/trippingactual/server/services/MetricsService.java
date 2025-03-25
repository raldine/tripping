package trippingactual.server.services;

import org.springframework.stereotype.Service;

import io.micrometer.core.annotation.Timed;
import io.micrometer.core.instrument.MeterRegistry;

@Service
public class MetricsService {

    private final MeterRegistry meterRegistry;
    private int currentUsers = 0;

    public MetricsService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;

        // Gauge: dynamic value (e.g. current number of users)
        meterRegistry.gauge("myapp_tripping_current_users", this, MetricsService::getCurrentUsers);
    }


    public void userLoggedIn() {
        currentUsers++;
    }

    public void userLoggedOut() {
        currentUsers--;
    }

    public int getCurrentUsers() {
        return currentUsers;
    }
}