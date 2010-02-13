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
    it 'should be not undefined'
      conn.should.not.be_null
    end
  end  
end