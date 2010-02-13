describe 'connection'
  before
    mysql = require('mysql');
  end
  
  describe 'success createConnection'
    before
      conn = new mysql.createConnection(config.mysql.hostname, 
					config.mysql.username,
					config.mysql.password,
					config.mysql.database);
    end
    it 'should be mysql.Connection'
      conn.should.be_a mysql.Connection
    end

    it ''
    end
  end
end