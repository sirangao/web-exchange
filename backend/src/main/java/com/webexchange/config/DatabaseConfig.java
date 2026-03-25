package com.webexchange.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import java.io.InputStream;
import java.util.Properties;

public class DatabaseConfig {

    private static HikariDataSource dataSource;

    static {
        try {
            Properties props = new Properties();
            InputStream is = DatabaseConfig.class.getClassLoader()
                .getResourceAsStream("db.properties");
            props.load(is);

            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(props.getProperty("db.url"));
            config.setUsername(props.getProperty("db.username"));
            config.setPassword(props.getProperty("db.password"));
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            config.setConnectionTimeout(30000);
            config.setIdleTimeout(600000);
            config.setMaxLifetime(1800000);

            dataSource = new HikariDataSource(config);
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize database pool", e);
        }
    }

    public static DataSource getDataSource() {
        return dataSource;
    }
}
